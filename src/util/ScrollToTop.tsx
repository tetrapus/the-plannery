import { useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

function ScrollToTop({ history }: RouteComponentProps) {
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  }, [history]);

  return null;
}

export default withRouter(ScrollToTop);
