import { paths } from '@routes/paths';
import CommunityService from '@services/community';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { IApiResponseError } from 'src/types/beneficiaries';
import {
  ICommunityAddDetails,
  ICommunityApiFilters,
  ICommunityListHookReturn,
  ICommunityTableAddValue,
} from 'src/types/community';

const calculateTotalBeneficiaries = (communities) => {
  let totalBeneficiariesSum = 0;

  // Iterate through the main array
  communities?.forEach((item) => {
    // Check if the item has a "summary" property
    if (item.summary && Array.isArray(item.summary)) {
      // Iterate through the "summary" array and add up the "total_beneficiaries" values
      item.summary.forEach((summaryItem) => {
        const totalBeneficiaries = summaryItem.total_beneficiaries;
        // Check if totalBeneficiaries is a number and not null or undefined
        if (
          typeof totalBeneficiaries === 'number' &&
          totalBeneficiaries !== null &&
          totalBeneficiaries !== undefined
        ) {
          totalBeneficiariesSum += totalBeneficiaries;
        }
      });
    }
  });

  return totalBeneficiariesSum;
};

export function useCommunities(params?: ICommunityApiFilters): ICommunityListHookReturn {
  const { data, isLoading, error } = useQuery(['communities', params], async () => {
    const res = await CommunityService.list(params);
    return res;
  });

  const communities = useMemo(() => data?.data?.rows || [], [data?.data?.rows]);
  const meta = useMemo(() => data?.data?.meta || {}, [data?.data?.meta]);
  const totalBeneficiariesSum = useMemo(
    () => calculateTotalBeneficiaries(communities),
    [communities]
  );

  return {
    totalBeneficiariesSum,
    communities,
    loading: isLoading,
    meta,
    error,
  };
}
export function useCommunity(address: string) {
  const { data, isLoading, error } = useQuery(['communities', address], async () => {
    const res = await CommunityService.detail(address);
    return res?.data;
  });

  const community = useMemo(() => data || [], [data]);

  return {
    community,
    loading: isLoading,
    error,
  };
}

export function useGeoLocation() {
  const { data } = useQuery(['communities/geoLoc'], async () => {
    const res = await CommunityService.geoLoc();
    return res?.data;
  });
  return {
    geoData: data,
  };
}

export function useCreateCommunities() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();
  return useMutation<ICommunityAddDetails, IApiResponseError, ICommunityTableAddValue>(
    ['categories/create'],
    async (data: ICommunityTableAddValue) => {
      const res = await CommunityService.create(data);
      console.log(res?.data);
      return res?.data;
    },
    {
      onError: (error) => {
        enqueueSnackbar(error?.message, { variant: 'error' });
      },
      onSuccess: (data) => {
        if (data?.address) push(paths.dashboard.general.community.edit(data.address));
        enqueueSnackbar('Community Created Successfully', { variant: 'success' });

        queryClient.invalidateQueries(['communities']);
      },
    }
  );
}

export function useUpdateCommunityAssets() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(
    ['community/update-assets'],
    async ({ address, data }: { address: string; data: any }) => {
      const res = await CommunityService.updateAssets(address, data);
      return res?.data;
    },
    {
      onError: () => {
        enqueueSnackbar('Error Updating Community assets', { variant: 'error' });
      },
      onSuccess: (data) => {
        enqueueSnackbar('Community Assets Created Successfully', { variant: 'success' });
        queryClient.invalidateQueries(['communities']);
      },
    }
  );
}
export function useGetMultipleImageAssets(params: string) {
  const { data, isLoading, error } = useQuery(['communities/images', params], async () => {
    const res = await CommunityService.getMultipleAsset(params);
    return res;
  });
  const image = useMemo(() => data?.data?.multiple || [], [data?.data?.multiple]);
  const name = useMemo(() => data?.data?.name || '', data?.data?.name);
  return {
    image,
    name,
  };
}

export function useEditCommunity(address: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  // const updateManager = useUpdateManager();
  return useMutation(
    ['community/edit'],
    async (data) => {
      console.log(data);
      const res = await CommunityService.editCommunity(address, data);
      return res?.data;
    },
    {
      onError: () => {
        enqueueSnackbar('Error Updating Community Data', { variant: 'error' });
      },
      onSuccess: (data) => {
        // const managerIds = data?.managers;
        enqueueSnackbar('Community Data Edited Successfully', { variant: 'success' });
        // managerIds.forEach((id) => {
        //   updateManager.mutate({
        //     id: Number(id),
        //     communityName: data?.name,
        //   });
        // });
        queryClient.invalidateQueries(['communities']);
      },
    }
  );
}
export function useRemoveCommunity() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(
    ['community/remove'],
    async (address: string) => {
      const res = await CommunityService.deleteCommunity(address);
      console.log(res);
      return res?.data;
    },
    {
      onError: () => {
        enqueueSnackbar('Error Updating Community Data', { variant: 'error' });
      },
      onSuccess: (data) => {
        enqueueSnackbar(data, { variant: 'success' });
        queryClient.invalidateQueries(['communities']);
      },
    }
  );
}

export function useUpdateToRmvGalleryImages(address: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(
    ['community/update/gallery'],
    async (fileName: string) => {
      const res = await CommunityService.rmvGalleryImageAssetFromCommunity(address, fileName);
      return res?.data;
    },
    {
      onError: () => {
        enqueueSnackbar('Error Removing Image', { variant: 'error' });
      },
      onSuccess: (data) => {
        enqueueSnackbar('Sucessfully Remove Image', { variant: 'success' });
        queryClient.invalidateQueries(['communities']);
      },
    }
  );
}
