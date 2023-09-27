type Breadcrumb = {
  to: string;
  title: string;
};

export const useMenu = () => {
  const isSidebarOpen = useState("isSidebarOpen", () => false);
  const title = useState("title", () => "");
  const breadcrumbs = useState<Breadcrumb[]>("breadcrumbs", () => []);

  const openSidebar = () => {
    isSidebarOpen.value = true;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const setTitle = (_title: string) => {
    title.value = _title;
  };

  const setBreadcrumbs = (_breadcrumbs: Breadcrumb[]) => {
    breadcrumbs.value = _breadcrumbs;
  };

  return {
    isSidebarOpen: isSidebarOpen,
    title: title,
    breadcrumbs: breadcrumbs,
    openSidebar,
    closeSidebar,
    setTitle,
    setBreadcrumbs,
  };
};
