import {
  MOCK_COMMENTS,
  MOCK_CONTACTS,
  MOCK_FRIEND_USER,
  MOCK_MESSAGES,
  MOCK_POSTS,
  MOCK_TAGS,
  MOCK_USER,
  MOCK_USERS,
} from '@/mock/data';
import axios, {
  type AxiosRequestConfig,
  AxiosRequestHeaders,
  Method,
} from 'axios';

const service = axios.create({
  baseURL: import.meta.env.VITE_HOST,
  timeout: 10000,
});

// Mock Interceptor
service.interceptors.request.use(
  (config) => {
    // Mock Login
    if (config.url?.includes('/v1/auth/login')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              token: 'mock-token-demo-mode-only',
            },
          },
        },
      });
    }

    // Mock User Info (Logged in user)
    if (config.url?.includes('/v1/user/info')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: MOCK_USER,
          },
        },
      });
    }

    // Mock User Profile (Public profile)
    if (config.url?.includes('/v1/user/profile')) {
      const username = config.params?.username;
      let userData = MOCK_USERS.find((u) => u.username === username);
      if (!userData) {
        userData = MOCK_USER;
      }

      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: userData,
          },
        },
      });
    }

    // Mock LiveKit token
    if (config.url?.includes('/live/token')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              token: 'mock-token-demo-mode-only',
              url: 'ws://localhost:7880',
            },
          },
        },
      });
    }

    // Mock Posts
    if (
      config.url?.includes('/v1/posts') ||
      config.url?.includes('/v1/user/posts')
    ) {
      let posts = MOCK_POSTS;

      // Filter by username if fetching user posts
      if (config.url?.includes('/v1/user/posts')) {
        const username = config.params?.username;
        if (username) {
          posts = MOCK_POSTS.filter((p) => p.user.username === username);
        }
      }

      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              list: posts,
              pager: {
                page: 1,
                page_size: 10,
                total_rows: posts.length,
              },
            },
          },
        },
      });
    }

    // Mock Tags (Hot/Follow)
    if (config.url?.includes('/v1/tags')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              topics: MOCK_TAGS.slice(0, 5),
              extral_topics: MOCK_TAGS.slice(0, 2),
            },
          },
        },
      });
    }

    // Mock Post Detail
    if (
      config.url?.includes('/v1/post') &&
      !config.url?.includes('/comments')
    ) {
      const id = config.params?.id || 101;
      const post = MOCK_POSTS.find((p) => p.id == id) || MOCK_POSTS[0];
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: post,
          },
        },
      });
    }

    // Mock Comments
    if (config.url?.includes('/v1/post/comments')) {
      const id = config.params?.id || 101;
      const comments = MOCK_COMMENTS.filter((c) => c.post_id == id);
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              list: comments,
              pager: {
                page: 1,
                page_size: 10,
                total_rows: comments.length,
              },
            },
          },
        },
      });
    }

    // Mock Contacts (Friends)
    if (
      config.url?.includes('/v1/user/contacts') ||
      config.url?.includes('/v1/user/follows') ||
      config.url?.includes('/v1/user/followings')
    ) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              list: MOCK_CONTACTS,
              pager: {
                page: 1,
                page_size: 10,
                total_rows: MOCK_CONTACTS.length,
              },
            },
          },
        },
      });
    }

    // Mock Messages
    if (config.url?.includes('/v1/user/messages')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              list: MOCK_MESSAGES,
              pager: {
                page: 1,
                page_size: 10,
                total_rows: MOCK_MESSAGES.length,
              },
            },
          },
        },
      });
    }

    // Mock Unread Msg Count
    if (config.url?.includes('/v1/user/msgcount/unread')) {
      return Promise.reject({
        response: {
          data: {
            code: 0,
            msg: 'success',
            data: {
              count: 1,
            },
          },
        },
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    const { data = {}, code = 0 } = response?.data || {};
    if (+code === 0) {
      return data || {};
    } else {
      Promise.reject(response?.data || {});
    }
  },
  (error = {}) => {
    const { response = {} } = error || {};

    // Handle Mock Responses (treat as success)
    if (response?.data?.code === 0) {
      return Promise.resolve(response.data.data);
    }

    // 重定向
    if (+response?.status === 401) {
      localStorage.removeItem('PAOPAO_TOKEN');

      if (response?.data.code !== 10005) {
        window.$message.warning(response?.data.msg || '鉴权失败');
      } else {
        // 打开登录弹窗
        window.$store.commit('triggerAuth', true);
      }
    } else {
      window.$message.error(response?.data?.msg || '请求失败');
    }
    return Promise.reject(response?.data || {});
  },
);

export default service;

export function request<T, R>(config: AxiosRequestConfig<T>): Promise<R> {
  // Mock logic is now handled by the interceptor above
  return service(config) as unknown as Promise<R>;
}
