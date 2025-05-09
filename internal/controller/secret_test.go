package controller

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	corev1 "k8s.io/api/core/v1"
	kerrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
)

const TESTNAMESPACE = "test-namespace"

var _ = Describe("FusionAccess Utilities", func() {
	var (
		clientset kubernetes.Interface
		ctx       context.Context
	)

	BeforeEach(func() {
		clientset = fake.NewSimpleClientset()
		ctx = context.TODO()
	})

	Describe("IbmEntitlementSecrets", func() {
		It("should return the correct IBM namespaces", func() {
			names := IbmEntitlementSecrets(TESTNAMESPACE)
			Expect(names).To(ConsistOf(
				TESTNAMESPACE,
				"ibm-spectrum-scale",
				"ibm-spectrum-scale-dns",
				"ibm-spectrum-scale-csi",
				"ibm-spectrum-scale-operator",
			))
		})
	})

	Describe("newSecret", func() {
		It("should return a properly formed Secret", func() {
			data := map[string][]byte{"foo": []byte("bar")}
			labels := map[string]string{"app": "test"}
			sec := newSecret("my-secret", "default", data, corev1.SecretTypeOpaque, labels)

			Expect(sec.Name).To(Equal("my-secret"))
			Expect(sec.Namespace).To(Equal("default"))
			Expect(sec.Data["foo"]).To(Equal([]byte("bar")))
			Expect(sec.Labels["app"]).To(Equal("test"))
			Expect(sec.Type).To(Equal(corev1.SecretTypeOpaque))
		})
	})

	Describe("getPullSecretContent", func() {
		const secretName = "fusion-pullsecret" //nolint:gosec

		It("should return error if secret doesn't exist", func() {
			_, err := getPullSecretContent(secretName, "default", ctx, clientset)
			Expect(err).To(HaveOccurred())
			Expect(kerrors.IsNotFound(err)).To(BeTrue())
		})

		It("should return error for wrong secret type", func() {
			secret := newSecret(secretName, "default", map[string][]byte{}, corev1.SecretTypeDockerConfigJson, nil)
			_, _ = clientset.CoreV1().Secrets("default").Create(ctx, secret, metav1.CreateOptions{})

			_, err := getPullSecretContent(secretName, "default", ctx, clientset)
			Expect(err).To(MatchError(ContainSubstring("is not of type")))
		})

		It("should return error if ibm-entitlement-key is missing", func() {
			secret := newSecret(secretName, "default", map[string][]byte{}, corev1.SecretTypeOpaque, nil)
			_, _ = clientset.CoreV1().Secrets("default").Create(ctx, secret, metav1.CreateOptions{})

			_, err := getPullSecretContent(secretName, "default", ctx, clientset)
			Expect(err).To(MatchError(ContainSubstring("does not contain ibm-entitlement-key")))
		})

		It("should return secret content if valid", func() {
			data := map[string][]byte{
				IBMENTITLEMENTNAME: []byte("my-secret-data"),
			}
			secret := newSecret(secretName, "default", data, corev1.SecretTypeOpaque, nil)
			_, _ = clientset.CoreV1().Secrets("default").Create(ctx, secret, metav1.CreateOptions{})

			content, err := getPullSecretContent(secretName, "default", ctx, clientset)
			Expect(err).ToNot(HaveOccurred())
			Expect(content).To(Equal([]byte("my-secret-data")))
		})
	})

	Describe("updateEntitlementPullSecrets", func() {
		var secretData []byte

		BeforeEach(func() {
			secretData = []byte("test-secret-data")
		})

		It("creates secrets in all IBM namespaces if not present", func() {
			err := updateEntitlementPullSecrets(secretData, ctx, clientset, TESTNAMESPACE)
			Expect(err).ToNot(HaveOccurred())

			for _, ns := range IbmEntitlementSecrets(TESTNAMESPACE) {
				sec, err := clientset.CoreV1().Secrets(ns).Get(ctx, IBMENTITLEMENTNAME, metav1.GetOptions{})
				Expect(err).ToNot(HaveOccurred())
				dockerConfigJSON, err := getDockerConfigSecretJSON(secretData)
				Expect(err).ToNot(HaveOccurred())
				Expect(sec.Data[".dockerconfigjson"]).To(Equal(dockerConfigJSON))
			}
		})

		It("updates existing secrets", func() {
			// Create dummy existing secrets with wrong data
			for _, ns := range IbmEntitlementSecrets(TESTNAMESPACE) {
				dummy := newSecret(IBMENTITLEMENTNAME, ns, map[string][]byte{
					".dockerconfigjson": []byte("old-data"),
				}, corev1.SecretTypeDockerConfigJson, nil)
				_, err := clientset.CoreV1().Secrets(ns).Create(ctx, dummy, metav1.CreateOptions{})
				Expect(err).ToNot(HaveOccurred())
			}

			err := updateEntitlementPullSecrets(secretData, ctx, clientset, TESTNAMESPACE)
			Expect(err).ToNot(HaveOccurred())

			for _, ns := range IbmEntitlementSecrets(TESTNAMESPACE) {
				sec, err := clientset.CoreV1().Secrets(ns).Get(ctx, IBMENTITLEMENTNAME, metav1.GetOptions{})
				Expect(err).ToNot(HaveOccurred())
				dockerConfigJSON, err := getDockerConfigSecretJSON(secretData)
				Expect(err).ToNot(HaveOccurred())

				Expect(sec.Data[".dockerconfigjson"]).To(Equal(dockerConfigJSON))
			}
		})
	})
})
