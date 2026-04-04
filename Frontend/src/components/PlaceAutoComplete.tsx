"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";

export interface PlaceDetails {
  lat: number;
  lng: number;
  name: string;
  formattedAddress: string;
}

interface AutocompleteSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails | null) => void;
  className: string;
  placeholder: string;
  defaultValue: string | null;
  userLocation?: { lat: number; lng: number } | null;
}

export const PlaceAutocomplete = ({
  onPlaceSelect,
  className,
  placeholder,
  defaultValue,
  userLocation,
}: PlaceAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(defaultValue || "");
  const [predictions, setPredictions] = useState<AutocompleteSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setPredictions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [sessionToken, setSessionToken] = useState<string>("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    let currentToken = sessionToken;
    if (!currentToken && value) {
      currentToken = Math.random().toString(36).substring(2, 15);
      setSessionToken(currentToken);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value) {
      setPredictions([]);
      setSessionToken("");
      onPlaceSelect(null);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.post<AutocompleteSuggestion[]>("/autocomplete", {
          input: value,
          sessionToken: currentToken,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
        });
        setPredictions(res.data);
      } catch (err) {
        console.error("Autocomplete failed:", err);
      }
    }, 500);
  };

  const handleSelect = async (prediction: AutocompleteSuggestion) => {
    try {
      const res = await api.post<PlaceDetails>("/place-details", {
        placeId: prediction.placeId,
        sessionToken: sessionToken,
      });
      const place = res.data;
      setInputValue(place.formattedAddress || place.name);
      setPredictions([]);
      setSessionToken(""); // Reset token after session is complete
      onPlaceSelect(place);
    } catch (err) {
      console.error("Place details failed:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && predictions.length > 0) {
      e.preventDefault();
      handleSelect(predictions[0]);
    }
  };

  return (
    <div className="autocomplete-container relative" ref={containerRef}>
      <input
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black w-full`}
      />
      {predictions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full mt-1 shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((p) => (
            <li
              key={p.placeId}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
              onClick={() => handleSelect(p)}
            >
              <span className="font-medium text-gray-800">{p.mainText}</span>
              {p.secondaryText && (
                <span className="text-sm text-gray-500">{p.secondaryText}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
