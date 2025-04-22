import { useStoreContext } from "./useStoreContext";

export const useDispatch = () => {
  const [, dispatch] = useStoreContext();
  return dispatch;
};
