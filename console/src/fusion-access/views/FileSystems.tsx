import { usePluginTranslations } from "@/hooks/usePluginTranslations";

export type FileSystemsProps = { data: string[] };
export const FileSystems: React.FC<FileSystemsProps> = (props) => {
  // const {} = props;
  // const [state, setState] = useStore();
  const { t } = usePluginTranslations();
  return null;
};

FileSystems.displayName = "FileSystems";
