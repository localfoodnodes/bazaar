import { AsyncStorage } from 'react-native';
import _ from 'lodash';
import moment from 'moment';

import * as actionTypes from './actionTypes';
import { api } from 'app/shared';

/**
 * Async action - fetch orders.
 *
 * @return {function}
 */
export function requestOrders() {
  return async function(dispatch, getState) {
    dispatch(fetchingOrders());

    let response = await api.call({
      url: '/api/v1/users/orders'
    });

    let orders = response.data;

    let groupedOrders = _.groupBy(orders, (order) => {
      return moment(order.date.date.date).format('YYYYMMDD');
    });

    return dispatch(receiveOrders(groupedOrders));
  }
}

export function fetchingOrders() {
  return {
    type: actionTypes.FETCHING_ORDERS,
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