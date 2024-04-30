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
            ConvertToUserUnits(node);
            if (node.className == "Group")
            {
                foreach (Child childNode in node.children)
                {
                    if (node.attrs.scaleX > 0)
                    {
                        childNode.attrs.scaleX *= node.attrs.scaleX;
                    }
                    if (node.attrs.scaleY > 0)
                    {
                        childNode.attrs.scaleY *= node.attrs.scaleY;
                    }
                    ConvertPixelsToUserUnits(childNode, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
                }
            }
            if (node.attrs.name == "passepartout")
            {
                HandlePath(node, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
            }
            else if (node.className == "Line")
            {
                HandleLine(node, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
            }
            else if (node.className == "Text")
            {
                ScaleFont(node, widthPixels, heightPixels, widthMillimeters, heightMillimeters);
            }
        }

        private static double CalculateScale(float widthPixels, float heightPixels, float widthMillimeter, float heightMillimeter)
        {
            double horScale = ConvertMillimetersToPoints(widthMillimeter) / widthPixels;
            double verScale = ConvertMillimetersToPoints(heightMillimeter) / heightPixels;
            return Math.Min(horScale, verScale);
        }

        private static void HandlePath(Child node, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters)
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

        private static void HandleLine(Child node, float widthPixels, float heightPixels, float widthMillimeters, float heightMillimeters)
        {
            double[] points = node.attrs.points;
            if (node.attrs.scaleX > 0)
            {
                points[0] = ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(points[0] * node.attrs.scaleX, widthPixels), widthMillimeters)); 
                points[2] = ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(points[2] * node.attrs.scaleX, widthPixels), widthMillimeters));               
            }
            else
            {
                points[0] = ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(points[0], widthPixels), widthMillimeters));
                points[2] = ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(points[2], widthPixels), widthMillimeters));
            }
            if (node.attrs.scaleY > 0)
            {
                points[1] = ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(points[1] * node.attrs.scaleY, heightPixels), heightMillimeters));
                points[3] = ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(points[3] * node.attrs.scaleY, heightPixels), heightMillimeters));
            }
            else
            {
                points[1] = ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(points[1], heightPixels), heightMillimeters));
                points[3] = ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(points[3], heightPixels), heightMillimeters));
            }
            node.attrs.points = points;
        }

        private static void ScaleNode(Child node, double scaleX, double scaleY)
        {
            if (scaleX > 0)
            {
                node.attrs.width *= scaleX;
            }
            if (scaleY > 0)
            {
                node.attrs.height *= scaleY;
            }
        }

        private static double ConvertToRelative(double value, double maximum)
        {
            return value / maximum;
        }

        private static double ConvertRelativeToMillimeter(double value, double maximum)
        {
            return value * maximum;
        }

        public static double ConvertMillimetersToPoints(double value)
        {
            return value * (75 / 25.4);
        }

        private static void ConvertAbsoluteToRelative(Child node, float width, float height)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX = ConvertToRelative(node.attrs.posX, width);
                node.attrs.posY = ConvertToRelative(node.attrs.posY, height);
            }
            node.attrs.padding = ConvertToRelative(node.attrs.padding, width);
            node.attrs.strokeWidth = ConvertToRelative(node.attrs.strokeWidth, width);
            node.attrs.x = ConvertToRelative(node.attrs.x, width);
            node.attrs.y = ConvertToRelative(node.attrs.y, height);
            node.attrs.width = ConvertToRelative(node.attrs.width, width);
            node.attrs.height = ConvertToRelative(node.attrs.height, height);
        }

        private static void ConvertRelativeToMillimeter(Child node, float width, float height)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX = ConvertRelativeToMillimeter(node.attrs.posX, width);
                node.attrs.posY = ConvertRelativeToMillimeter(node.attrs.posY, height);
            }            
            node.attrs.padding = ConvertRelativeToMillimeter(node.attrs.padding, width);
            node.attrs.strokeWidth = ConvertRelativeToMillimeter(node.attrs.strokeWidth, width);
            node.attrs.x = ConvertRelativeToMillimeter(node.attrs.x, width);
            node.attrs.y = ConvertRelativeToMillimeter(node.attrs.y, height);
            node.attrs.width = ConvertRelativeToMillimeter(node.attrs.width, width);
            node.attrs.height = ConvertRelativeToMillimeter(node.attrs.height, height);
        }

        private static void ConvertToUserUnits(Child node)
        {
            if (node.attrs.name == "element")
            {
                node.attrs.posX = ConvertMillimetersToPoints(node.attrs.posX);
                node.attrs.posY = ConvertMillimetersToPoints(node.attrs.posY);
            }
            node.attrs.padding = ConvertMillimetersToPoints(node.attrs.padding);
            node.attrs.strokeWidth = ConvertMillimetersToPoints(node.attrs.strokeWidth);
            node.attrs.x = ConvertMillimetersToPoints(node.attrs.x);
            node.attrs.y = ConvertMillimetersToPoints(node.attrs.y);
            node.attrs.width = ConvertMillimetersToPoints(node.attrs.width);
            node.attrs.height = ConvertMillimetersToPoints(node.attrs.height);
        }

        private static void ScaleFont(Child node, float widthPixels, float heightPixels, float widthMillimeter, float heightMillimeter)
        {
            double scale = CalculateScale(widthPixels, heightPixels, widthMillimeter, heightMillimeter);
            Console.WriteLine($"Scale: {scale}");
            node.attrs.fontSize = (int)Math.Round(node.attrs.fontSize * scale);
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
                    coords[0] = (float)ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(coords[0], widthPixels), widthMillimeters)) + x;
                }
                else
                {
                    coords[0] = (float)ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(coords[0] * child.attrs.scaleX, widthPixels), widthMillimeters)) + x;
                }
                return string.Join("", command[0], string.Join(',', coords));
            }
            if (command.StartsWith('V') || command.StartsWith('v'))
            {
                if (child.attrs.scaleY == 0.0)
                {
                    coords[0] = (float)ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(coords[0], heightPixels), heightMillimeters));
                }
                else
                {
                    coords[0] = (float)ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(coords[0] * child.attrs.scaleY, heightPixels), heightMillimeters));
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
                        coords[i] = (float)ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(coords[i], widthPixels), widthMillimeters)) + x;
                    }
                    else
                    {
                        coords[i] = (float)ConvertMillimetersToPoints(ConvertRelativeToMillimeter(ConvertToRelative(coords[i] * child.attrs.scaleX, widthPixels), widthMillimeters)) + x;
                    }
                }
                else
                {
                    if (child.attrs.scaleY == 0.0)
                    {
                        coords[i] = (float)ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(coords[i], heightPixels), heightMillimeters));
                    }
                    else
                    {
                        coords[i] = (float)ConvertMillimetersToPoints(heightMillimeters - ConvertRelativeToMillimeter(ConvertToRelative(coords[i] * child.attrs.scaleY, heightPixels), heightMillimeters));
                    }
                }
            }
            return string.Join(',', coords);
        }
    }
}
