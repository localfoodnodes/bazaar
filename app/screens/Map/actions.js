import { api, sharedActions, trans } from 'app/shared';
import * as actionTypes from './actionTypes';

export function fetchCurrentLocation() {
  return async function(dispatch, getState) {
    try {
      dispatch(sharedActions.locationActions.askLocationPermission(false));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);

      dispatch(receiveDefaultLocation({
        coords: {
          accuracy: 5,
          altitude: 0,
          altitudeAccuracy: -1,
          heading: -1,
          latitude: 56,
          longitude: 13.3,
          speed: -1,
        }
      }));
    }
  }
}

export function requestCurrentLocation() {
  return {
    type: actionTypes.REQUEST_CURRENT_LOCATION,
    location: null,
    loading: true,
  }
}

export function receiveDefaultLocation(location) {
  return {
    type: actionTypes.RECEIVE_DEFAULT_LOCATION,
    location: location,
    loading: false,
  }
}

export function fetchNodes(lang) {
  return async function (dispatch, getState) {
    try {
      dispatch(requestNodes());

      let response = await api.call({
        url: '/api/v1/nodes'
      });

      let nodes = await response.json();

      dispatch(receiveNodes(nodes));
    } catch (error) {
      sharedActions.systemActions.checkMaintenanceMode(dispatch, error);
      dispatch(receiveNodes(null)); // No nodes will show server error warning
    }
  }
}

export function requestNodes() {
  return {
    type: actionTypes.REQUEST_NODES,
    loading: true,
    refresh: false,
    nodes: null,
  }
}

export function receiveNodes(nodes) {
  return {
    type: actionTypes.RECEIVE_NODES,
    loading: false,
    refresh: false,
    nodes: nodes,
  }
}

// export function receiveNodesFailed(error, lang) {
//   return {
//     type: actionTypes.RECEIVE_NODES_FAILED,
//     loading: false,
//     refresh: false,
//     nodes: null,
//     title: trans('Nodes', lang),
//     message: trans('Failed loading nodes', lang),
//   }
// }
