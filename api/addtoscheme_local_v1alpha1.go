package api

import (
	scalev1alpha "github.com/validatedpatterns/openshift-storage-scale-operator/api/v1alpha1"
)

func init() {
	// Register the types with the Scheme so the components can map objects to GroupVersionKinds and back
	AddToSchemes = append(AddToSchemes, scalev1alpha.SchemeBuilder.AddToScheme)
}
