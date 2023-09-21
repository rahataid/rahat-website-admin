import { axiosInstance, endpoints } from '@utils/axios';
import { ICommunityApiFilters, ICommunityDetails, IcommunityAssets } from 'src/types/community';

const CommunityService = {
  list: (params?: ICommunityApiFilters) =>
    axiosInstance.get(endpoints.communitiy.list, { params }),
  create: (data: ICommunityDetails) =>
    axiosInstance.post(endpoints.communitiy.create, { ...data }),
    updateAssets:(data:IcommunityAssets)=> axiosInstance.patch(endpoints.communitiy.updateAssets(data.id),{...data})
 };

export default CommunityService;
