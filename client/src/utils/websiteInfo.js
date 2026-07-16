export const getWebsiteInfo = (url) => {
  if (!url) {
    return {
      title: "",
      favicon: "",
      domain: "",
    };
  }

  try {
    // Add https:// if missing
    const formattedUrl = url.startsWith("http")
      ? url
      : `https://${url}`;

    const parsedUrl = new URL(formattedUrl);

    const hostname = parsedUrl.hostname.replace("www.", "");

    const domain = hostname.split(".")[0];

    const title =
      domain.charAt(0).toUpperCase() + domain.slice(1);

    const favicon = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;

    return {
      title,
      favicon,
      domain: hostname,
    };
  } catch (error) {
    return {
      title: "",
      favicon: "",
      domain: "",
    };
  }
};