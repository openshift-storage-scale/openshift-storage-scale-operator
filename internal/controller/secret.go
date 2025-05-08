package controller

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

const FUSIONPULLSECRETNAME = "fusion-pullsecret" //nolint:gosec
const IBMENTITLEMENTNAME = "ibm-entitlement-key"
const IBMREGISTRY = "cp.icr.io"
const IBMREGISTRYUSER = "cp"

func IbmEntitlementSecrets() []string {
	return []string{
		"ibm-spectrum-scale",
		"ibm-spectrum-scale-dns",
		"ibm-spectrum-scale-csi",
		"ibm-spectrum-scale-operator",
	}
}

func newSecret(name, namespace string, secret map[string][]byte, secretType corev1.SecretType, labels map[string]string) *corev1.Secret {
	k8sSecret := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels:    labels,
		},
		Data: secret,
		Type: secretType,
	}
	return k8sSecret
}

func getPullSecretContent(name, namespace string, ctx context.Context, full kubernetes.Interface) ([]byte, error) { //nolint:unparam
	secret, err := full.CoreV1().Secrets(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}
	if secret.Type != corev1.SecretTypeOpaque {
		return nil, fmt.Errorf("secret %s is not of type %s", name, corev1.SecretTypeOpaque)
	}
	if secret.Data == nil {
		return nil, fmt.Errorf("secret %s has no data", name)
	}
	secData, ok := secret.Data[IBMENTITLEMENTNAME]
	if !ok {
		return nil, fmt.Errorf("secret %s does not contain %s", name, IBMENTITLEMENTNAME)
	}
	return secData, nil
}

func getDockerConfigSecret(secret []byte) map[string]any {
	auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", IBMREGISTRYUSER, secret)))
	return map[string]any{
		"auths": map[string]any{
			IBMREGISTRY: map[string]string{
				"auth":     auth,
				"username": IBMREGISTRYUSER,
			},
		},
	}
}

func updateEntitlementPullSecrets(secret []byte, ctx context.Context, full kubernetes.Interface) error {
	secretJson := getDockerConfigSecret(secret)
	dockerConfigJSON, err := json.Marshal(secretJson)
	if err != nil {
		return err
	}
	secretData := map[string][]byte{
		".dockerconfigjson": []byte(dockerConfigJSON),
	}
	destSecretName := IBMENTITLEMENTNAME //nolint:gosec

	for _, destNamespace := range IbmEntitlementSecrets() {
		ibmPullSecret := newSecret(
			destSecretName,
			destNamespace,
			secretData,
			"kubernetes.io/dockerconfigjson",
			nil,
		)
		_, err := full.CoreV1().Secrets(destNamespace).Get(ctx, destSecretName, metav1.GetOptions{})
		if err != nil {
			if kerrors.IsNotFound(err) {
				// Resource does not exist, create it
				_, err := full.CoreV1().Secrets(destNamespace).Create(context.TODO(), ibmPullSecret, metav1.CreateOptions{})
				if err != nil {
					return err
				}
				log.Log.Info(fmt.Sprintf("Created Secret %s in ns %s", destSecretName, destNamespace))
				continue
			}
			return err
		}
		// The destination secret already exists so we upate it and return an error if they were different so the reconcile loop can restart
		_, err = full.CoreV1().Secrets(destNamespace).Update(context.TODO(), ibmPullSecret, metav1.UpdateOptions{})
		if err == nil {
			log.Log.Info(fmt.Sprintf("Updated Secret %s in ns %s", destSecretName, destNamespace))
			continue
		}
	}
	return nil
}
