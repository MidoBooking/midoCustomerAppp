import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import COLORS from "../consts/colors";

export const MenuItems = [
  {
    icon: "scissors",
    key: "barbershop",
    name: "Barbershop",
  },
  {
    icon: "eye",
    key: "lashes",
    name: "Eyebrows & Lashes",
  },
  {
    icon: "paw",
    key: "nails",
    name: "Nail Salon",
  },
  {
    icon: "fire",
    key: "hairremoval",
    name: "Hair Removal",
  },
  {
    icon: "scissors",
    key: "hairsalon",
    name: "Hair Salon",
  },
  {
    icon: "smile-o",
    key: "makeupartist",
    name: "Makeup Artist",
  },
  {
    icon: "diamond",
    key: "weddingmakeup",
    name: "Wedding Makeup Artist",
  },
  {
    icon: "hand-paper-o",
    key: "massage",
    name: "Massage",
  },
  {
    icon: "scissors",
    key: "dayspa",
    name: "Day Spa",
  },
  {
    icon: "heartbeat",
    key: "healthwellness",
    name: "Health and Wellness",
  },
  {
    icon: "scissors",
    key: "personaltrainer",
    name: "Personal Trainer",
  },
  {
    icon: "sun-o",
    key: "skincare",
    name: "Skin Care",
  },
  {
    icon: "paint-brush",
    key: "tattooshops",
    name: "Tattoo Shops",
  },
];

const MenuContainer = ({ menuItems, columns }) => {
  const renderMenuItem = (menuItem) => (
    <TouchableOpacity
      key={menuItem.key}
      style={styles.menuItem}
      onPress={() => {
        // Your navigation logic here
      }}
    >
      <FontAwesomeIcon
        name={menuItem.icon}
        size={30}
        color={COLORS.white}
        style={styles.menuIcon}
      />
      <Text style={styles.menuText}>{menuItem.name}</Text>
    </TouchableOpacity>
  );

  const numberOfRows = Math.ceil(menuItems.length / columns);

  const rows = Array.from({ length: numberOfRows }, (_, rowIndex) => {
    const rowItems = menuItems.slice(
      rowIndex * columns,
      rowIndex * columns + columns
    );
    return (
      <View key={rowIndex} style={styles.menuRow}>
        {rowItems.map((menuItem) => renderMenuItem(menuItem))}
      </View>
    );
  });

  return <View>{rows}</View>;
};

const styles = StyleSheet.create({
  menuItem: {
    alignItems: "center",
    margin: 10,
  },
  menuIcon: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
  },
  menuText: {
    color: COLORS.black,
    marginTop: 10,
    fontWeight: "bold",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default MenuContainer;
