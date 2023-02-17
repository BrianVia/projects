import React, { FC, useState } from 'react';

type CoffeeShopCardType = {
  name: string;
  photoUrl: string;
  address: string;
  businessHours: string;
  websiteLink: string;
  internetSpeed: {
    download: number;
    upload: number;
  };
};

export const CoffeeShopCard: FC<CoffeeShopCardType> = ({
  name,
  photoUrl,
  address,
  businessHours,
  websiteLink,
  internetSpeed,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [speedReport, setSpeedReport] = useState({
    uploadSpeed: null,
    downloadSpeed: null,
    speedtestURL: '',
    SSID: '',
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (event: React.KeyboardEvent) => {
    const { name, value } = event.target;
    setSpeedReport({
      ...speedReport,
      [name]: value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    console.log(speedReport);
    handleCloseModal();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md flex mb-6">
      <div className="w-1/3 coffee-shop-photo">
        <img src={photoUrl} alt={name} className="w-full h-auto" />
      </div>
      <div className="w-2/3 p-4 coffee-shop-details">
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{address}</p>
        <p className="text-gray-600 mb-4">{businessHours}</p>
        <a
          href={websiteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mb-4 block"
        >
          Visit website
        </a>
        <p className="text-gray-600">
          Internet speed: {internetSpeed.download} Mbps download,{' '}
          {internetSpeed.upload} Mbps upload
        </p>
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-white rounded px-4 py-2 mt-4 hover:bg-blue-600"
        >
          Provide speed report
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-1/3">
            <h3 className="text-lg font-bold mb-4">Speed report</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="uploadSpeed"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Upload speed (Mbps):
                </label>
                <input
                  type="text"
                  id="uploadSpeed"
                  name="uploadSpeed"
                  value={speedReport.uploadSpeed || ''}
                  onChange={handleInputChange}
                  className="border border-gray-400 p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="downloadSpeed"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Download speed (Mbps):
                </label>
                <input
                  type="text"
                  id="downloadSpeed"
                  name="downloadSpeed"
                  value={speedReport.downloadSpeed || ''}
                  onChange={handleInputChange}
                  className="border border-gray-400 p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="speedtestURL"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Speedtest URL:
                </label>
                <input
                  type="text"
                  id="speedtestURL"
                  name="speedtestURL"
                  value=""
                ></input>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
