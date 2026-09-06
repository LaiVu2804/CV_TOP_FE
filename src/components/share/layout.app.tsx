interface IProps {
  children: React.ReactNode;
}

const LayoutApp = (props: IProps) => {
  return <>{props.children}</>;
};

export default LayoutApp;
