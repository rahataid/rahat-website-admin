// import { yupResolver } from '@hookform/resolvers/yup';
// import { Alert, AlertTitle, Grid } from "@mui/material";
// import { Stack } from "@mui/system";
// import { useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { ICommunityTableFilterValue } from "src/types/community";
// import * as Yup from 'yup';

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
// utils
// routes
import { useParams } from 'src/routes/hook';
// types
// assets
// components
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Card, MenuItem } from '@mui/material';
import MapView from '@sections/map-view';
import { useCategory } from 'src/api/category';
import { useEditCommunity } from 'src/api/community';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { ICommunityTableFilterValue } from 'src/types/community';

interface FormValues extends ICommunityTableFilterValue {}
type Props = {
  community: any;
};

const CommunityEditForm = ({ community }: Props) => {
  const { address } = useParams();

  const { isLoading, mutate } = useEditCommunity(address);
  const { categories } = useCategory();
  const [latLang, setLatLang] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [updateLatLang, setUpdateLatLang] = useState();

  // const { community } = useCommunity(address);
  const NewCommunitySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    country: Yup.string(),
    latitude: Yup.number().moreThan(-90),
    longitude: Yup.number().lessThan(90),
    fundRaisedUsd: Yup.number(),
    fundRaisedLocal: Yup.string(),
    localCurrency: Yup.string(),
    category: Yup.string(),
    description: Yup.string(),
    district: Yup.string(),
  });

  const defaultValues = useMemo<FormValues>(
    () => ({
      name: '',
      country: '',
      categoryId: '',
      latitude: 0,
      longitude: 0,
      fundRaisedUsd: 0,
      fundRaisedLocal: '',
      localCurrency: '',
      description: '',
      district: '',
      managers: [],
    }),
    []
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(NewCommunitySchema),
    defaultValues,
  });

  const { handleSubmit, setValue, getValues } = methods;
  useEffect(() => {
    if (community) {
      const defaultValuesKeys = Object.keys(defaultValues) as (keyof FormValues)[];
      const communityKeys = Object.keys(community) as (keyof FormValues)[];

      const keysToSet = defaultValuesKeys.filter((key) => communityKeys.includes(key));

      keysToSet.forEach((key) => {
        const value = community[key];
        const formKey = key as keyof FormValues;
        setValue(formKey, value as string);
      });
    }
  }, [defaultValues, community, setValue]);

  useEffect(() => {
    if (community) {
      setValue('categoryId', community?.category?.id);
    }
  }, [defaultValues, community, setValue]);

  const onSubmit = useCallback(
    (data) => {
      mutate(data);
    },
    [mutate]
  );

  // const obj = { latitude: getValues('latitude'), longitude: getValues('longitude') };
  useEffect(() => {
    if (community) {
      setLatLang({
        latitude: getValues('latitude'),
        longitude: getValues('longitude'),
      });
    }
  }, [community, getValues]);

  const getUpdateLatLang = (data: any) => {
    setUpdateLatLang(data);
  };

  useEffect(() => {
    if (updateLatLang) {
      setValue('latitude', updateLatLang.latitude);
      setValue('longitude', updateLatLang.longitude);
    }
  }, [setValue, updateLatLang]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={5}>
            <Card sx={{ p: 1 }}>
              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                }}
                sx={{ m: 1 }}
              >
                <RHFTextField name="name" label="Name" />

                <RHFSelect name="categoryId" label="Category">
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <Box />
                <RHFTextField name="localCurrency" label="Currency" />
                <RHFTextField name="fundRaisedLocal" label="FundRaisedLocal" />
                <RHFTextField name="fundRaisedUsd" label="FundRaisedUsd" />
                <RHFTextField name="district" label="District" />
                <RHFTextField name="country" label="Country" />
                <RHFTextField
                  name="description"
                  label="Description"
                  multiline
                  sx={{ gridColumn: 'span 3' }}
                  rows={6}
                />
              </Box>
            </Card>
          </Stack>
        </Grid>
        <Grid xs={12} md={4}>
          <Stack spacing={5}>
            <Card sx={{ p: 1 }}>
              <Box
                rowGap={2}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(2, 1fr)',
                }}
                sx={{ m: 1 }}
              >
                <RHFTextField name="latitude" label="Latitude" InputLabelProps={{ shrink: true }} />
                <RHFTextField
                  name="longitude"
                  label="Longitude"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              {/* @ts-ignore */}

              <MapView geoData={latLang} onDataChange={getUpdateLatLang} />
            </Card>
            <Stack alignItems="flex-end">
              <LoadingButton type="submit" variant="outlined" color="success" loading={isLoading}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};
export default CommunityEditForm;
