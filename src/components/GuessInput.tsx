import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '../data/countries';

interface GuessInputProps {
  onGuess: (guess: string) => void;
  disabled: boolean;
}

export const GuessInput: React.FC<GuessInputProps> = ({ onGuess, disabled }) => {
  const [guess, setGuess] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const getSuggestions = (input: string): string[] => {
    if (!input.trim()) return [];
    
    const searchTerm = input.toLowerCase();
    const matches = new Set<string>();

    countries.forEach(country => {
      if (country.name.toLowerCase().includes(searchTerm)) {
        matches.add(country.name);
      }
      country.aliases?.forEach(alias => {
        if (alias.toLowerCase().includes(searchTerm)) {
          matches.add(country.name);
        }
      });
    });

    return Array.from(matches).slice(0, 5);
  };

  useEffect(() => {
    setSuggestions(getSuggestions(guess));
    setSelectedIndex(-1);
  }, [guess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuess(guess.trim());
      setGuess('');
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex > -1) {
      e.preventDefault();
      const selectedGuess = suggestions[selectedIndex];
      setGuess(selectedGuess);
      onGuess(selectedGuess);
      setSuggestions([]);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setGuess(suggestion);
    onGuess(suggestion);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto mt-6">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Game Over" : "Guess the country..."}
          className="w-full px-4 py-3 bg-gray-700 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={disabled || !guess.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-white disabled:opacity-50"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                  index === selectedIndex ? 'bg-gray-700' : ''
                }`}
                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 1)' }}
                transition={{ duration: 0.2 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuessInput;