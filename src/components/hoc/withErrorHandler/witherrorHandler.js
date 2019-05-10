import React from "react";

import Modal from "../../ui/Modal/Modal";
import Aux from "../AuxWrapper";

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends React.Component {
        state = {
            error: null
        };
        componentDidMount() {
            axios.interceptors.response.use(res => res, error => {
                this.setState({ error: error });
                return 
            });
            axios.interceptors.request.use(request => {
                // Clear my errors
                this.setState({ error: null });
                return request;
            });
        }

        errorConfirmedByUserHandler = () => {
            this.setState({ error: null });
        }

        render() {
            return (
                <Aux>
                    <Modal show={this.state.error} modalClosed={this.errorConfirmedByUserHandler}>
                        {this.state.error ? this.state.error.message : null}
                        <p>Something went wrong!!</p>
                    </Modal>
                    <WrappedComponent {...this.props} />
                </Aux>
            );
        }
    }
}

export default withErrorHandler;