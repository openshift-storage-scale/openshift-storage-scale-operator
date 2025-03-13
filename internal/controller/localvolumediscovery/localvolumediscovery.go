package localvolumediscovery

import (
	"context"

	"github.com/pkg/errors"

	scalev1alpha "github.com/openshift-storage-scale/openshift-storage-scale-operator/api/v1alpha1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"sigs.k8s.io/controller-runtime/pkg/client"
)

func NewLocalVolumeDiscovery(namespace string) *scalev1alpha.LocalVolumeDiscovery {
	return &scalev1alpha.LocalVolumeDiscovery{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "auto-discover-devices",
			Namespace: namespace,
		},
	}
}
func CreateOrUpdateLocalVolumeDiscovery(ctx context.Context, devicefinder *scalev1alpha.LocalVolumeDiscovery, cl client.Client) error {
	oldCP := &scalev1alpha.LocalVolumeDiscovery{}
	if err := cl.Get(ctx, client.ObjectKeyFromObject(devicefinder), oldCP); apierrors.IsNotFound(err) {
		if err := cl.Create(ctx, devicefinder); err != nil {
			return errors.Wrap(err, "could not create device finder")
		}
	} else if err != nil {
		return errors.Wrap(err, "could not check for existing device finder")
	} else {
		oldCP.OwnerReferences = devicefinder.OwnerReferences
		oldCP.Spec = devicefinder.Spec
		if err := cl.Update(ctx, oldCP); err != nil {
			return errors.Wrap(err, "could not update device finder")
		}
	}
	return nil
}
