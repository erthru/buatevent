const calculate = (width: number) => {
  if (width < 768) {
    return "sm";
  }

  if (width < 992) {
    return "md";
  }

  if (width < 1200) {
    return "lg";
  }

  return "xl";
};

export const useBreakpoint = () => {
  const breakpoint = useState("breakpoint", () => "sm");

  if (typeof window !== "undefined") {
    const width = document.body.clientWidth;

    nextTick(() => {
      breakpoint.value = calculate(width);
    });

    window.addEventListener("resize", () => {
      const width = document.body.clientWidth;
      breakpoint.value = calculate(width);
    });
  }

  return breakpoint;
};
