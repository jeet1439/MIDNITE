import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../constants/colors.js";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: COLORS.textPrimary,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  logout: {
    borderBottomWidth: 0,
  }
});

export default styles;
