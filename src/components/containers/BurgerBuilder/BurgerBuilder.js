import React from "react";
import axios from "../../../axios.orders";

import Aux from "../../hoc/AuxWrapper";
import Burger from "../../Burger/Burger";
import BuildControls from "../../Burger/BuildControls/BuildControls";
import Modal from "../../ui/Modal/Modal";
import OrderSummary from "../../Burger/OrderSummary/OrderSummary";
import Spinner from "../../ui/Spinner/Spinner";
import withErrorHandler from "../../hoc/withErrorHandler/witherrorHandler";

import { config } from "../../../config";

const INGREDIENT_PRICES = {
  salad: 0.5,
  cheese: 0.4,
  meat: 1.3,
  bacon: 0.7
};

class BurgerBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredients: null,
      //   ingredients: {
      //     salad: 0,
      //     bacon: 0,
      //     cheese: 0,
      //     meat: 0
      //   },
      totalPrice: 4,
      purchasable: false,
      purchasing: false,
      loading: false,
      error: false
    };

    this.addIngredientHandler = this.addIngredientHandler.bind(this);
    this.removeIngredientHandler = this.removeIngredientHandler.bind(this);
    this.updatePurchasableState = this.updatePurchasableState.bind(this);
    this.purchaseHandler = this.purchaseHandler.bind(this);
    this.purchaseCancelHandler = this.purchaseCancelHandler.bind(this);
    this.purchaseContinueHandler = this.purchaseContinueHandler.bind(this);
  }

  componentDidMount() {
    axios
      .get(`${config.firebaseURL}ingredients.json`)
      .then(response => {
        this.setState({ ingredients: response.data });
      })
      .catch(err => {
        this.setState({ error: true });
      });
  }

  purchaseContinueHandler() {
    //alert("You continue!");
    console.log("[BurgerBuilder] Continuing purchase");
    this.setState({ loading: true });
    const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      customer: {
        name: "Kevo",
        address: {
          street: "1234 Test St",
          zipcode: 123456,
          country: "USA"
        },
        email: "test@test.com"
      },
      deliveryMethod: "carry-out"
    };
    axios
      .post("/orders.json", order) // * Firebase needs the node name then end with .json
      .then(res => {
        //console.log(res)
        this.setState({ loading: false, purchasing: false });
      })
      .catch(err => {
        //console.log(err)
        this.setState({ loading: false, purchasing: false });
      });
  }

  purchaseCancelHandler() {
    this.setState({ purchasing: false });
  }

  purchaseHandler() {
    this.setState({ purchasing: true });
  }

  updatePurchasableState(ingredients) {
    const sum = Object.keys(ingredients)
      .map(key => {
        return ingredients[key];
      })
      .reduce((sum, el) => {
        return sum + el;
      }, 0);
    this.setState({ purchasable: sum > 0 });
  }

  addIngredientHandler(type) {
    const oldCount = this.state.ingredients[type];
    const updatedCount = oldCount + 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceTotal = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice + priceTotal;
    this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });
    this.updatePurchasableState(updatedIngredients);
  }

  removeIngredientHandler(type) {
    const oldCount = this.state.ingredients[type];
    if (oldCount <= 0) {
      console.error("No ingredient amount to remove!");
      return;
    }
    const updatedCount = oldCount - 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceSubtraction = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice - priceSubtraction;
    this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });
    this.updatePurchasableState(updatedIngredients);
  }

  render() {
    const disabledInfo = {
      ...this.state.ingredients
    };

    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }
    let orderSummary = null;
    let burger = this.state.error ? (
      <p>Ingredients Cannot be loaded</p>
    ) : (
      <Spinner />
    );
    if (this.state.ingredients) {
      burger = (
        <Aux>
          <Burger ingredients={this.state.ingredients} />
          <BuildControls
            ingredientAdded={this.addIngredientHandler}
            ingredientRemoved={this.removeIngredientHandler}
            disabled={disabledInfo}
            purchasable={this.state.purchasable}
            ordered={this.purchaseHandler}
            price={this.state.totalPrice}
          />
        </Aux>
      );
      orderSummary = (
        <OrderSummary
          ingredients={this.state.ingredients}
          purchaseCanceled={this.purchaseCancelHandler}
          purchaseContinue={this.purchaseContinueHandler}
          price={this.state.totalPrice}
        />
      );
    }

    if (this.state.loading) {
      orderSummary = <Spinner />;
    }

    return (
      <Aux>
        <Modal
          show={this.state.purchasing}
          modalClosed={this.purchaseCancelHandler}
        >
          {orderSummary}
        </Modal>
        {burger}
      </Aux>
    );
  }
}

export default withErrorHandler(BurgerBuilder, axios);
