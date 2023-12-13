export const Spinner = (props: JSX.IntrinsicElements["div"]) => {
  return (
    <div
      {...props}
      className={`animate-spin w-4 h-4 border-2 border-t-transparent rounded-full ${
        props.className || ""
      }`}
    ></div>
  );
};
