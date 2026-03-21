"use client";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState } from "react";

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  className: string;
  placeholder: string;
  defaultValue: string | null;
}

export const PlaceAutocomplete = ({
  onPlaceSelect,
  className,
  placeholder,
  defaultValue,
}: PlaceAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const places = useMapsLibrary("places");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!places || !value) {
      setPredictions([]);
      onPlaceSelect(null);
      return;
    }

    places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: value,
    }).then((results) => {
      setPredictions(results.suggestions);
    });
  };

  const handleSelect = (
    prediction: google.maps.places.AutocompleteSuggestion,
  ) => {
    if (!places) return;

    const service = new places.PlacesService(document.createElement("div"));
    service.getDetails(
      {
        placeId: prediction.placePrediction!.placeId,
        fields: ["geometry", "name", "formatted_address"],
      },
      (place) => {
        if (place) {
          setInputValue(
            place.formatted_address ||
              prediction.placePrediction!.mainText!.text,
          );
          setPredictions([]);
          onPlaceSelect(place);
        }
      },
    );
  };

  return (
    <div className="autocomplete-container relative">
      <input
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black w-full`}
      />
      {predictions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full mt-1 shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((p) => (
            <li
              key={p.placePrediction?.placeId}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
              onClick={() => handleSelect(p)}
            >
              {/* Main text bold */}
              <span className="font-medium text-gray-800">
                {p.placePrediction?.mainText?.toString()}
              </span>
              {/* Secondary text smaller and lighter */}
              {p.placePrediction?.secondaryText && (
                <span className="text-sm text-gray-500">
                  {p.placePrediction.secondaryText.toString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
