import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useRefinementList } from "react-instantsearch"
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator, 
  CommandShortcut,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useState } from "react";

const FilterItem =  ({
  attribute,
  limit = 10,
  searchable = false,
  clientSearch = false,
  synonms = {},
  placeholder = 'Search ...',
}: {
  attribute: string;
  limit?: number;
  searchable?: boolean;
  clientSearch?: boolean;
  synonms?: Record<string, string>;
  placeholder?: string;
}) => {

  const {
    items,
    refine,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({
    attribute: attribute,
    limit: limit,
  })

  const [searchValue, setSearchValue] = useState('')
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const search = (name: string) => {
    setSearchValue(name)
    if (!clientSearch) {
      searchForItems(name)
    }
    if (name == '') {
      const refinedItems = items.filter((item) => item.isRefined)
      setSelected(refinedItems.map((item) => item.value))
    }
  }

  const openChange = (open: boolean) => {
    if (open == true) {
      setSearching(true)
    }
    else {
      setSearching(false)
      search('')
    }
  }

  const select = (value: string) => {
    setSearchValue('')
    refine(value)
  }

  return <Popover modal={true} onOpenChange={openChange}>
    <PopoverTrigger asChild>
      <Button variant="outline" className={`w-full justify-start h-max`}>
        {searching ?
          "Selecting..." :
          (selected.length == 0 ? 
            'All' :
            <div className="flex flex-col gap-1">
              {selected.map(i => 
                <Badge variant="outline" className="">
                  {synonms[i] ? `${i} - ${synonms[i]}` : i}
                </Badge>
              )}
            </div>
          )
        }
      </Button>
    </PopoverTrigger>
    <PopoverContent className="p-0" align="start">
      <Command shouldFilter={clientSearch}>
        {searchable && 
          <CommandInput
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={512}
            value={searchValue}
            onValueChange={(value) => search(value)}
            placeholder={placeholder}
          />
        }
        <ScrollArea className="h-[300px]">
          <CommandList className="max-h-none">
            <CommandEmpty>No results found.</CommandEmpty>
            {items.sort((a, b) => {
              if (a.isRefined) return -1
              if (b.isRefined) return 1
              return 0
            }).map((item) => (
              <CommandItem
                className="cursor-pointer"
                key={item.label}
                onSelect={() => select(item.value)}
              >
                <div className="flex w-full items-center">
                  <div className="ml-1 mr-2">
                    <Check size={16} className={`${item.isRefined ? '' : 'opacity-0'}`} />
                  </div>
                  <span className="mr-4">
                    {synonms[item.label] ? 
                      `${item.label} - ${synonms[item.label]}` :
                      item.label
                    }
                  </span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </PopoverContent>
  </Popover>
}

export default FilterItem;