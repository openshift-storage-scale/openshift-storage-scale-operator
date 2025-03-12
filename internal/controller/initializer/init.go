package initializer

import (
	"context"

	"github.com/go-logr/logr"
	"github.com/pkg/errors"

	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/validatedpatterns/openshift-storage-scale-operator/internal/controller/console"
	"github.com/validatedpatterns/openshift-storage-scale-operator/internal/utils"
)

// Initializer runs some bootstrapping code:
// - create console plugin
type initializer struct {
	cl     client.Client
	logger logr.Logger
}

// New returns a new Initializer
func New(mgr ctrl.Manager, logger logr.Logger) *initializer {
	return &initializer{
		cl:     mgr.GetClient(),
		logger: logger,
	}
}

// Start will start the Initializer
func (i *initializer) Start(ctx context.Context) error {
	ns, err := utils.GetDeploymentNamespace()
	if err != nil {
		return errors.Wrap(err, "unable to get the deployment namespace")
	}

	if err = console.CreateOrUpdatePlugin(ctx, i.cl, ns, ctrl.Log.WithName("console-plugin")); err != nil {
		return errors.Wrap(err, "failed to create or update the console plugin")
	}

	return nil
}
