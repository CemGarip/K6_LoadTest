import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },   // Yavaş yavaş 5 kullanıcıya çık
    { duration: '40s', target: 10 },  // 10 kullanıcı ile devam et
    { duration: '20s', target: 0 },   // Trafiği yavaşça düşür
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // %95'lik istek 800ms'den kısa olmalı
    http_req_failed: ['rate<0.05'],   // Hata oranı %5'in altında olmalı
  },
};

const BASE_URL = 'https://food-mobile-client-api-gateway.fooddev.getirapi.com/restaurants/dashboard';
const TOKEN = '17540395369416ed25ac674144ae5cd7f2e946b4ac7834a6c44a5e1af02bd650865c0aae4d3e7';

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  };

  const url = `${BASE_URL}?lat=41.08049570000001&lon=29.0358123&acc=0.0&addressId=678901943e19e060aa61891a&navigationVersion=5&useNewSorting=false`;

  const res = http.get(url, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1); // her kullanıcıdan sonra 1 saniye beklet
}