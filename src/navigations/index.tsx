import { NavigationContainer } from "@react-navigation/native";
import { MainDrawerNavigation } from "./MainDrawerNavigation";

export function Navigation() {
    return (
        <NavigationContainer>
            <MainDrawerNavigation />
        </NavigationContainer>
    )
}