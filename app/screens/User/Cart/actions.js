import * as actionTypes from './actionTypes'
import * as ordersActions from '../Orders/actions'
import { api, sharedActions, trans } from 'app/shared';
import _ from 'lodash';

/**
 * Async action - fetch cart.
 *
 * @return {function}
 */
export function fetchCart(refreshing) {
  return async function(dispatch, getState) {
    if (refreshing) {
      dispatch(refreshCart());
    } else {
      dispatch(requestCart());
    }

    let response = await api.call({
      url: '/api/v1/user/cart'
    });

    let cart = await response.json();

    dispatch(receiveCart(cart));
  }
}

export function refreshCart() {
  return {
    type: actionTypes.REFRESH_CART,
    refreshing: true,
  }
}

export function requestCart() {
  return {
    type: actionTypes.REQUEST_CART,
    cart: null,
    loading: true,
    refreshing: false,
  }
}

export function receiveCart(cart) {
  return {
    type: actionTypes.RECEIVE_CART,
    cart: cart || {},
    loading: false,
    refreshing: false,
  }
}

/**
 * Async action - remove cart item.
 *
 * @return {function}
 */
export function removeCartItem(cartDateItemLinkId, lang) {
  return async function(dispatch, getState) {
    try {
      dispatch(removingCartItem(cartDateItemLinkId));

      let response = await api.call({
        url: `/api/v1/user/cart/${cartDateItemLinkId}`,
        method: 'delete',
      });

      let removedCartDateItemLinkId = await response.json();

      dispatch(removedCartItem(removedCartDateItemLinkId));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);

      let errorMessage = error.text();
      dispatch(removeCartItemFailed(errorMessage, lang));
    }
  }
}

export function removingCartItem(cartDateItemLinkId) {
  return {
    type: actionTypes.REMOVING_CART_ITEM,
    cartDateItemLinkId: cartDateItemLinkId
  }
}

export function removedCartItem(cartDateItemLinkId) {
  return {
    type: actionTypes.REMOVED_CART_ITEM,
    cartDateItemLinkId: cartDateItemLinkId,
  }
}

export function removeCartItemFailed(errorMessage, lang) {
  return {
    type: actionTypes.REMOVE_CART_ITEM_FAILED,
    title: trans('Cart', lang),
    message: errorMessage,
  }
}

/**
 * Async action - update cart item.
 *
 * @return {function}
 */
export function updateCartItem(cartDateItemLinkId, quantity, lang) {
  return async function(dispatch, getState) {
    try {
      dispatch(updatingCartItem(cartDateItemLinkId));

      let response = await api.call({
        url: '/api/v1/user/cart',
        method: 'put',
        body: {
          cartDateItemLinkId: cartDateItemLinkId,
          quantity: quantity
        }
      });

      let cartDateItemLink = await response.json();
      dispatch(updatedCartItem(cartDateItemLink));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);

      if (error.status === 410) {
        dispatch(removeCartItem(cartDateItemLinkId, lang));
      }

      let errorMessage = await error.text();
      dispatch(updatingCartFailed(errorMessage, lang));
    }
  }
}

export function updatingCartItem(cartDateItemLinkId) {
  return {
    type: actionTypes.UPDATING_CART_ITEM,
    id: cartDateItemLinkId,
  }
}

export function updatedCartItem(cartDateItemLink) {
  return {
    type: actionTypes.UPDATED_CART_ITEM,
    cartItem: cartDateItemLink,
  }
}

export function updatingCartFailed(errorMessage, lang) {
  return {
    type: actionTypes.UPDATING_CART_ITEM_FAILED,
    title: trans('Cart', lang),
    message: errorMessage,
  }
}

/**
 * Async action - create order.
 *
 * @return {function}
 */
export function createOrder(lang) {
  return async function(dispatch, getState) {
    try {
      dispatch(createOrderInProgress());

      let response = await api.call({
        method: 'post',
        url: '/api/v1/user/order'
      });

      dispatch(createOrderSuccess(lang));
      dispatch(ordersActions.fetchOrders(lang));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);

      let errorMessage = await error.text();
      dispatch(createOrderFailed(errorMessage, lang));
    }
  }
}

export function createOrderInProgress() {
  return {
    type: actionTypes.CREATE_ORDER_IN_PROGRESS,
    creating: true,
  }
}

export function createOrderSuccess(lang) {
  return {
    type: actionTypes.CREATE_ORDER_SUCCESS,
    creating: false,
    created: true,
    cart: null,
    title: trans('Order', lang),
    message: trans('Your order was created.', lang),
  }
}

export function createOrderFailed(errorMessage, lang) {
  return {
    type: actionTypes.CREATE_ORDER_FAILED,
    creating: false,
    created: false,
    title: trans('Order', lang),
    message: errorMessage
  }
}