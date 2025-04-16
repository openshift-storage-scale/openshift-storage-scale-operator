import { createContext } from "react";

export type TPageContextGetters = {
  documentTitle: string;
  pageTitle: string;
  pageDescription: string;
  pageActions: React.ReactNode[];
};

export type TPageContextSetters = {
  setDocumentTitle: React.Dispatch<
    React.SetStateAction<TPageContextGetters["documentTitle"]>
  >;
  setPageTitle: React.Dispatch<
    React.SetStateAction<TPageContextGetters["pageTitle"]>
  >;
  setPageDescription: React.Dispatch<
    React.SetStateAction<TPageContextGetters["pageDescription"]>
  >;
  setPageActions: React.Dispatch<
    React.SetStateAction<TPageContextGetters["pageActions"]>
  >;
};

export type TPageContext = TPageContextGetters & TPageContextSetters;

export const PageContext = createContext<TPageContext | null>(null);
