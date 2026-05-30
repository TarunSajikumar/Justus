import {
View,
Text,
TouchableOpacity
}
from "react-native";

import {
LinearGradient
}
from "expo-linear-gradient";

import { COLORS }
from "../../theme/colors";

export default function PremiumScreen(){

return(

<View
style={{
flex:1,
backgroundColor:COLORS.background,
padding:20
}}
>

<Text
style={{
fontSize:32,
fontWeight:"bold",
color:"#fff",
marginBottom:25
}}
>
Premium ✨
</Text>

<LinearGradient
colors={[
"#FF4D8D",
"#FF85A1"
]}
style={{
padding:28,
borderRadius:28,
marginBottom:25
}}
>

<Text
style={{
fontSize:26,
fontWeight:"bold",
color:"#fff"
}}
>
JUSTUS PRO
</Text>

<Text
style={{
color:"#fff",
marginTop:12,
lineHeight:24
}}
>
Unlock more storage and premium features.
</Text>

</LinearGradient>

<View
style={{
backgroundColor:COLORS.card,
padding:22,
borderRadius:22,
marginBottom:18
}}
>

<Text
style={{
color:"#fff",
fontSize:18,
fontWeight:"bold"
}}
>
2GB Free Storage
</Text>

<Text
style={{
color:COLORS.subtext,
marginTop:8
}}
>
Upgrade for more space
</Text>

</View>

<TouchableOpacity
style={{
backgroundColor:COLORS.primary,
padding:18,
borderRadius:18,
alignItems:"center"
}}
>

<Text
style={{
color:"#fff",
fontWeight:"bold",
fontSize:16
}}
>
Upgrade Now
</Text>

</TouchableOpacity>

</View>

);

}
