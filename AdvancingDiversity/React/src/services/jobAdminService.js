import axios from 'axios';
import { API_HOST_PREFIX, onGlobalSuccess, onGlobalError } from './serviceHelpers';

const jobsAdminApi = {
    endpoint: `${API_HOST_PREFIX}/api/jobsadmin`
}

const addJob = (payload) => {
    const config = {
        method: 'POST',
        url: jobsAdminApi.endpoint,
        data: payload, 
        crossdomain: true, 
        withCredentials: true, 
        headers: { 'Content-Type': 'application/json' },
    };
    return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export { addJob };
