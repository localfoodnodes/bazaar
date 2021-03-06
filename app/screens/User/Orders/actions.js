import _ from 'lodash';
import moment from 'moment/min/moment-with-locales';

import * as actionTypes from './actionTypes';
import * as orderActions from '../Order/actions';
import { api, sharedActions, trans } from 'app/shared';

/**
 * Async action - fetch orders.
 *
 * @return {function}
 */
export function fetchOrders(lang) {
  return async function(dispatch, getState) {
    try {
      dispatch(requestOrders());

      let response = await api.call({
        url: '/api/v1/user/orders'
      });

      let orders = await response.json();

      let orderedOrders = [];
      for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        let orderDate = order.date;
        let key = moment(orderDate.date.date).format('YYYYMMDD');

        // Check if key exists
        let index = _.findIndex(orderedOrders, function(o) {
          return o.key == key;
        });

        if (index === -1) {
          orderedOrders.push({
            key: key,
            items: [],
          });

          // Set index
          index = orderedOrders.length - 1;
        }

        orderedOrders[index].items.push(order);
      }

      dispatch(receiveOrders(orderedOrders.reverse()));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);

      dispatch(receiveOrdersFailed(error, lang));
    }
  }
}

export function requestOrders() {
  return {
    type: actionTypes.REQUEST_ORDERS,
    loading: true,
  }
}

export function receiveOrders(orders) {
  return {
    type: actionTypes.RECEIVE_ORDERS,
    orders: orders,
    loading: false,
  }
}

export function receiveOrdersFailed(lang) {
  return {
    type: actionTypes.RECEIVE_ORDERS_FAILED,
    orders: null,
    loading: false,
    title: trans('Orders', lang),
    message: trans('Failed loading orders', lang),
  }
}
