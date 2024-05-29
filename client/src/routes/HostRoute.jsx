import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/Shared/LoadingSpinner";
import useRole from "../hooks/useRole";

const HostRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const {role, isLoading} = useRole()
  const location = useLocation();

  if (loading || isLoading) return <LoadingSpinner />;

  if (user && role === "host") return children;

  return <Navigate to="/dashboard" state={location.pathname} replace="true" />;
};

HostRoute.propTypes = {
  children: PropTypes.element,
};

export default HostRoute;