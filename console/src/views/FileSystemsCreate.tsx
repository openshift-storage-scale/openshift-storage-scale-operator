import { StoreProvider } from "@/contexts/store/context";
import { reducer, initialState } from "@/contexts/store/reducer";

const FileSystemsCreate: React.FC = () => {
  return (
    <StoreProvider reducer={reducer} initialState={initialState}>
      {/* <CreateFileSystemsApp /> */}
    </StoreProvider>
  );
};

FileSystemsCreate.displayName = "FileSystemsCreate";
export default FileSystemsCreate;
