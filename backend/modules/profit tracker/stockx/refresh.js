const got = require("got");
const console = require("../../../utils/logger");
const refresh = async (token) => {
  const res = got.get("https://stockx.com/", {
    searchParams: {
      forceLogin: "true",
      accessToken: token,
      gaEvent: "Logged%20In",
    },
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      dnt: "1",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-site",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
    },
    maxRedirects: 100,
  });

  console.log(res);
};

refresh(
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5USkNNVVEyUmpBd1JUQXdORFk0TURRelF6SkZRelV4TWpneU5qSTNNRFJGTkRZME0wSTNSQSJ9.eyJodHRwczovL3N0b2NreC5jb20vY3VzdG9tZXJfdXVpZCI6IjNhOTI0YmNlLTU4YjgtMTFlOC1hZmVkLTEyZjkyNmEyYzZjNiIsImh0dHBzOi8vc3RvY2t4LmNvbS9nYV9ldmVudCI6IkxvZ2dlZCBJbiIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuc3RvY2t4LmNvbS8iLCJzdWIiOiJhdXRoMHwzYTkyNGJjZS01OGI4LTExZTgtYWZlZC0xMmY5MjZhMmM2YzYiLCJhdWQiOiJnYXRld2F5LnN0b2NreC5jb20iLCJpYXQiOjE2MTYyNzc2ODAsImV4cCI6MTYxNjMyMDg4MCwiYXpwIjoiT1Z4cnQ0VkpxVHg3TElVS2Q2NjFXMER1Vk1wY0ZCeUQifQ.FXMK3OWd-qeqDehPxizgkEnPM1D1zJ_QhPCmmITGZ3G4UaU83xdhBTqE1NaDC7xQ1rAPZQdLKrCoy47OBo9KQF1d35d7fyz6Xi-Svgp4tVWkc0PR3hRVWMa0XIqU-UqdmAWsGC_s1DlCXnqUTvlXr6A2gVKRg8pXuFNlJywbEGyEF_X83Uum4BpQ9Y2_fldCje8oziXbc_f9DqxlCGjn4m9okL8wIZAWojzXT_1ta90yjD_zE1dUH2yuettGypWjSZcHvVVV6phV092PDXHsS9y7jtXxlX6g44l-4AsrCMoLJVGcRT5tI4jAdWs6L80_dGzms2vfQv3S8BZ2Z0pYAA"
);
