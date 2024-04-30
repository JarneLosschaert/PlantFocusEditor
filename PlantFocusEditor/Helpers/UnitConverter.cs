using iText.Layout.Renderer;
using Library.Classes;

namespace PlantFocusEditor.Helpers
{
    public class UnitConverter
    {
        public static RootObject ConvertJsonPixelsToMillimeters(RootObject json, float[] pixels, float[] millimeters)
        {
            float widthPixels = pixels[0];
            float heightPixels = pixels[1];
            float widthMillimeters = millimeters[0];
            float heightMillimeters = millimeters[1];
            foreach (Child node in json.children)
            {
                ConvertPixelsToUserUnits(node, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
            }
            return json;
        }

        public static double ConvertMillimeterToUserUnits(float millimeters)
        {
            return millimeters * (72 / 25.4);
        }

        private static void ConvertPixelsToUserUnits(Child node, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters)
        {
            ScaleNode(node, node.attrs.scaleX, node.attrs.scaleY);
            ConvertAbsoluteToRelative(node, widthPixels, heightPixels);
            ConvertRelativeToMillimeter(node, widthMillimeters, heightMillimeters);
            //ConvertToUserUnits(node);
            if (node.className == "Group")
            {
                foreach (Child childNode in node.children)
                {
                    if (node.attrs.scaleX > 0 )
                    {
                        childNode.attrs.scaleX *= node.attrs.scaleX;
                    }
                    if (node.attrs.scaleY > 0 )
                    {
                        childNode.attrs.scaleY *= node.attrs.scaleY;
                    }
                    ConvertPixelsToUserUnits(childNode, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
                }
            }
            if (node.attrs.name == "passepartout")
            {
                string[] commands = PathUtils.ParsePathData(node.attrs.data);
                string data = "";
                foreach (string command in commands)
                {
                    if (command != "" && !command.StartsWith('Z'))
                    {
                        string newCommand = TransformCoords(command, (float)node.attrs.x, (float)node.attrs.y, widthPixels, heightPixels, widthMillimeters, heightMillimeters, node);
                        data += newCommand;
                    }
                }
                node.attrs.data = data;
            }
        }

        private static void ScaleNode(Child node, double scaleX, double scaleY)
        {
            if (scaleX > 0) {
                node.attrs.width *= scaleX;
            }
            if (scaleY > 0)
            {
                node.attrs.height *= scaleY;
            }
        }

        private static void ConvertAbsoluteToRelative(Child node, float width, float height)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX = node.attrs.posX / width;
                node.attrs.posY = node.attrs.posY / height;
            }            
            node.attrs.x = (node.attrs.x / width);
            node.attrs.y = (node.attrs.y / height);
            node.attrs.width = (node.attrs.width / width);
            node.attrs.height = (node.attrs.height / height);
        }

        private static void ConvertRelativeToMillimeter(Child node, float width, float height)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX *= width;
                node.attrs.posY *= height;
            }            
            node.attrs.x = node.attrs.x * width;
            node.attrs.y = node.attrs.y * height;
            node.attrs.width = node.attrs.width * width;
            node.attrs.height = node.attrs.height * height;
        }

        private static void ConvertToUserUnits(Child node)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX = node.attrs.posX / 25.4 * 72;
                node.attrs.posY = node.attrs.posY / 25.4 * 72;
            }
            if (node.className == "Text")
            {
                node.attrs.fontSize = (int)Math.Round(node.attrs.fontSize * 25.4 / 72);
            }
            node.attrs.x = node.attrs.x / 25.4 * 72;
            node.attrs.y = node.attrs.y / 25.4 * 72;
            node.attrs.width = node.attrs.width / 25.4 * 72;
            node.attrs.height = node.attrs.height / 25.4 * 72;
        }

        private static string TransformCoords(string command, float x, float y, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters, Child child)
        {
            Console.WriteLine(command);
            string stringCoords = command.Substring(1, command.Length - 1);
            Console.WriteLine(stringCoords);
            float[] coords = null;
            if (stringCoords.Contains(','))
            {
                coords = Array.ConvertAll(stringCoords.Split(','), float.Parse);
            }
            else if (stringCoords.Contains(' '))
            {
                coords = Array.ConvertAll(stringCoords.Split(' '), float.Parse);
            }
            else
            {
                coords = [float.Parse(stringCoords)];
            }
            if (coords.Length > 1)
            {
                string points = TransformCoords(coords, child, x, y, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
                return string.Join("", command[0], points);
            }
            if (command.StartsWith('H') || command.StartsWith('h'))
            {
                if (child.attrs.scaleX == 0.0)
                {
                    coords[0] = coords[0] / widthPixels;
                    coords[0] = coords[0] * widthMillimeters + x;
                }
                else
                {
                    coords[0] = (float)(coords[0] * child.attrs.scaleX / widthPixels);
                    coords[0] = coords[0] * widthMillimeters + x;
                }
                return string.Join("", command[0], string.Join(',', coords));
            }
            if (command.StartsWith('V') || command.StartsWith('v'))
            {
                if (child.attrs.scaleY == 0.0)
                {
                    coords[0] = coords[0] / heightPixels;
                    coords[0] = heightMillimeters - coords[0] * heightMillimeters;
                }
                else
                {
                    coords[0] = (float)(coords[0] * child.attrs.scaleY / heightPixels);
                    coords[0] = heightMillimeters - coords[0] * heightMillimeters;
                }
            }
            string newCoords = string.Join(',', coords);
            return string.Join("", command[0], newCoords);
        }

        private static string TransformCoords(float[] coords, Child child, float x, float y, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters)
        {
            for (int i = 0; i < coords.Length; i++)
            {
                if (i % 2 == 0)
                {
                    if (child.attrs.scaleX == 0.0)
                    {
                        coords[i] = coords[i] / widthPixels;
                        coords[i] = coords[i] * widthMillimeters + x;
                    }
                    else
                    {
                        coords[i] = (float)(coords[i] * child.attrs.scaleX / widthPixels);
                        coords[i] = coords[i] * widthMillimeters + x;
                    }
                }
                else
                {
                    if (child.attrs.scaleY == 0.0)
                    {
                        coords[i] = coords[i] / heightPixels;
                        coords[i] = heightMillimeters - coords[i] * heightMillimeters;
                    }
                    else
                    {
                        coords[i] = (float)(coords[i] * child.attrs.scaleY / heightPixels);
                        coords[i] = heightMillimeters - coords[i] * heightMillimeters;
                    }
                }
            }
            return string.Join(',', coords);
        }
    }
}
