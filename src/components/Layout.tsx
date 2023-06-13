import { children, JSXElement } from "solid-js";
import NavBar from "./NavBar";

interface LayoutProps {
  children: JSXElement;
  className: string;
}

export const Layout = (props: LayoutProps) => {
  const c = children(() => props.children);
  return (
    <>
      <NavBar />
      <main class={props.className}>{c()}</main>
    </>
  );
};
