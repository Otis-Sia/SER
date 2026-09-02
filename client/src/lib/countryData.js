import data from '../data/countriesData.json';

export const Country = {
  getAllCountries: () => data.countries,
};

export const City = {
  getCitiesOfCountry: (isoCode) => {
    if (isoCode === 'KE') {
      return data.kenyaCities;
    }
    return [];
  },
};
