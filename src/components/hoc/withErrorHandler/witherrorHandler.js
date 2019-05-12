import React from "react";

import Modal from "../../ui/Modal/Modal";
import Aux from "../AuxWrapper";

const withErrorHandler = (WrappedComponent, axios) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null
      };

      // Here is where we should create interceptors
      this.responseInterceptor = axios.interceptors.response.use(
        res => res,
        error => {
          this.setState({ error: error });
          return;
        }
      );
      this.requestInterceptor = axios.interceptors.request.use(request => {
        // Clear my errors
        this.setState({ error: null });
        return request;
      });
    }
    componentDidMount() {
      // axios.interceptors.response.use(res => res, error => {
      //     this.setState({ error: error });
      //     return
      // });
      // axios.interceptors.request.use(request => {
      //     // Clear my errors
      //     this.setState({ error: null });
      //     return request;
      // });
    }

    componentWillUnmount() {
      axios.interceptors.request.eject(this.requestInterceptor);
      axios.interceptors.response.eject(this.responseInterceptor);
    }

    errorConfirmedByUserHandler = () => {
      this.setState({ error: null });
    };

    render() {
      return (
        <Aux>
          <Modal
            show={this.state.error}
            modalClosed={this.errorConfirmedByUserHandler}
          >
            {this.state.error ? this.state.error.message : null}
            <p>Something went wrong!!</p>
          </Modal>
          <WrappedComponent {...this.props} />
        </Aux>
      );
    }
  };
};

export default withErrorHandler;
