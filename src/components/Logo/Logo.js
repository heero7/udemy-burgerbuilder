import React from "react";

import burgerLogo from "../../assests/images/burger_logo.png";

import classes from "./Logo.css";

const logo = props => {
    return (
        <div className={classes.Logo} style={{height: props.height}}>
            <img src={burgerLogo} alt="Logo for our burger site" />
        </div>
    );
}

export default logo;