"use client"
import qs from "query-string"
import useDebounce from "@/hooks/useDebounce"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Input from "./Input"

const SearchInput = () => {
    const router = useRouter()
    const [value, setValue] = useState<string>("")
    const debouncceValue = useDebounce<string>(value, 500)
   
    useEffect(() => {
        const query = {
            title: debouncceValue,
        }

        const url = qs.stringifyUrl({
            url: '/search',
            query: query
        })

        router.push(url)
    }, [debouncceValue, router])

    return (
        <Input
          placeholder="What do yo waant to listen to ?"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
    )
}

export default SearchInput