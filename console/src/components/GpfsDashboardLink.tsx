import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useWatchSpectrumScaleCluster } from "@/hooks/useWatchSpectrumScaleCluster";
import {
  useK8sWatchResource,
  type K8sResourceCommon,
} from "@openshift-console/dynamic-plugin-sdk";
import { Button, Skeleton } from "@patternfly/react-core";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";

type GpfsDashboardLinkProps = {
  fileSystem: FileSystem;
};

type Route = K8sResourceCommon & {
  spec: {
    host: string;
  };
};

const GpfsDashboardLink: React.FC<GpfsDashboardLinkProps> = ({
  fileSystem,
}) => {
  const { t } = useFusionAccessTranslations();
  const [storageClusters, storageClustersLoaded, storageClustersError] =
    useWatchSpectrumScaleCluster({ isList: true, limit: 1 });

  const storageClusterName = storageClusters?.[0]?.metadata?.name;

  const [routes, routesLoaded, routesErr] = useK8sWatchResource<Route[]>(
    storageClusterName
      ? {
          groupVersionKind: {
            group: "route.openshift.io",
            version: "v1",
            kind: "Route",
          },
          namespace: fileSystem.metadata?.namespace,
          isList: true,
          selector: {
            matchLabels: {
              "app.kubernetes.io/instance": storageClusterName,
              "app.kubernetes.io/name": "gui",
            },
          },
        }
      : null
  );

  if (!storageClustersLoaded || !routesLoaded) {
    return <Skeleton screenreaderText={t("Loading gpfs dashboard link")} />;
  }

  if (
    !storageClusters.length ||
    storageClustersError ||
    !routes.length ||
    routesErr
  ) {
    return <span className="text-secondary">{t("Not available")}</span>;
  }

  const href = `https://${routes[0].spec.host}/gui#files-filesystems-/${fileSystem.metadata?.name || ""}`;

  return (
    <Button
      component="a"
      variant="link"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      icon={<ExternalLinkAltIcon />}
      iconPosition="end"
      isInline
    >
      {href}
    </Button>
  );
};

export default GpfsDashboardLink;
