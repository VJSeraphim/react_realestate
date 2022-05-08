import { useEffect, useState } from 'react'
import { Flex, Box, Text, Select, Input, Spinner, Icon, Button} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { MdCancel } from 'react-icons/md'
import Image from 'next-image'

import { filterData, getFilterValues } from '../utils/filterData' 
import { baseUrl, fetchApi } from '../utils/fetchApi'
import noresult from '../assets/noresult.svg'


const SearchFilters = () => {
    const [filters, setFilters] = useState(filterData)
    const [locationData, setLocationData] = useState()
    const [searchTerm, setSearchTerm] = useState('')
    const [showLocations, setShowLocations] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const searchProperties = (filterValues) => {
        const path = router.pathname
        const { query } = router
        const values = getFilterValues(filterValues)

        values.forEach((item) => {
            if(item.value && filterValues?.[item.name]) {
                query[item.name] = item.value
            }   
        })

        router.push({ pathname: path, query: query })
    }

    useEffect(() => {
        if(searchTerm !== '') {
            const fetchData = async () => {
                setLoading(true)
                const data = await fetchApi(`${baseUrl}/auto-complete?query=${searchTerm}`)
                setLoading(false)
                setLocationData(data?.data)
            }

            fetchData()
        }
    }, [searchTerm])
    

    return (
        <Flex bg="gray.100" p="4" justifyContent="center" flexWrap="wrap">
            {filters.map((filter) => (
                <Box key={filter.queryName}>
                    <Select 
                        onChange={(e) => searchProperties({[filter.queryName]: e.target.value})}
                        palceholder={filter.placeholder}
                        w="fit-content"
                        p="2"
                    >
                        {filter?.items?.map((item) => (
                            <option value={item.value} key={item.value}>
                                {item.name}
                            </option>
                        ))}
                    </Select>
                </Box>
            ))}
            <Flex flexDir={column}>
                <Button 
                    onClick={() => setShowLocations(!showLocations)}
                    border='1px'
                    borderColor='gray.200'
                    marginTop='2'
                >
                    Search Location
                </Button>
                {showLocations && (
                    <Flex flexDir='column' pos='relative' paddingTop='2'>
                        <Input
                            placeholder='What is on your mind?'
                            value={searchTerm}
                            w='300px'
                            focusBorderColor='gray.300'
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm !== '' && (
                            <Icon 
                                as={MdCancel}
                                pos='absolute'
                                cursor='pointer'
                                right='5'
                                top='5'
                                zIndex='100'
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                        { loading && <Spinner margin='auto' marginTop={'3'}/>}
                        { showLocations && (
                            <Box height='300px' overflow='auto'>
                                { locationData?.map((loc) => (
                                    <Box
                                        key={loc.id}
                                        onClick={() => {
                                            searchProperties({ locationExternalIDs: loc.externalId})
                                            setShowLocations(false)
                                            setSearchTerm(loc.name)
                                        }}
                                    >
                                        <Text 
                                            cursor='pointer'
                                            bg='gray.200'
                                            p='2'
                                            borderBottom='1px'
                                            borderColor='gray.100'
                                        >
                                            {loc.name}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Flex>
                )}
            </Flex>
        </Flex>
    )
}

export default SearchFilters