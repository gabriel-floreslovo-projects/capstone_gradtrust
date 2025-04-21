import Select from 'react-select';

type OptionType = { 
    label: string, 
    value: string
};

interface SearchableDropdownProps {
    options: OptionType[],
    onChange: (selected: OptionType | null) => void;
};

export default function SearchableDropdown ({ options, onChange }: SearchableDropdownProps) {
    return (
        <Select
            options={options}
            onChange={onChange}
            isSearchable
            placeholder="Select an option"
        />
    );
}