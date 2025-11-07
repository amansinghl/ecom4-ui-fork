export async function getUserDetails(token: string) {
  if (token) {
    return await (
      await fetch("https://ecom.vamaship.com/api/v1/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
    ).json();
  }
  return false;
}

export async function getCredits(token: string) {
  if (token) {
    return await (
      await fetch("https://ecom.vamaship.com/api/v1/transactions/credit", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
    ).json();
  }
  return false;
}
