import AsyncStorage from "@react-native-async-storage/async-storage";
import { Products } from "../types/Products";

const Products_KEY = "@todo_app:products";

export const saveProducts = async (products: Products[]): Promise<void> => {
    const jsonValue = JSON.stringify(products);
    await AsyncStorage.setItem(Products_KEY, jsonValue);
}

export const loadProducts = async (): Promise<Products[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(Products_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error("Erro ao carregar tarefas", error)
        return [];
    }
}