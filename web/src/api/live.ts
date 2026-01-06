import { request } from '@/utils/request';

export const getLiveToken = (params: { room_name: string }) => {
  return request({
    method: 'post',
    url: '/live/token',
    data: params,
  });
};
