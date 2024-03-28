using System.Text.RegularExpressions;

namespace PlantFocusEditor.Helpers
{
    public class PathUtils
    {
        public static string[] GetScaledCommands(string pathData, double stageHeight, double marginHeight)
        {
            // Calculate the scale factor
            double height = stageHeight - marginHeight;
            double heightPath = FindHeightPassePartout(pathData);
            double scale = height / heightPath;

            // Parse the path data
            string[] commands = ParsePathData(pathData);

            // Scale the points in the commands
            for (int i = 0; i < commands.Length; i++)
            {
                if (!commands[i].StartsWith('Z'))
                {
                    double[] points = ExtractPointsFromCommand(commands[i]);

                    for (int j = 0; j < points.Length; j += 2)
                    {
                        points[j] *= scale;
                        points[j + 1] *= scale;
                    }

                    commands[i] = BuildCommandString(commands[i][0], points);
                }                
            }
            return commands;
        }

        private static string BuildCommandString(char command, double[] points)
        {
            // Build the command string from the command character and the points
            string result = $"{command}{string.Join(",", points)}";
            return result;
        }

        public static double FindHeightPassePartout(string pathData)
        {
            // Parse the path data
            string[] commands = ParsePathData(pathData);

            // Initialize maxY to zero
            double maxY = 0;

            // Iterate through the commands
            foreach (string command in commands)
            {
                if (!command.StartsWith('Z'))
                {
                    double[] points = ExtractPointsFromCommand(command);
                    // Iterate through points and update maxY if needed
                    for (int j = 1; j < points.Length; j += 2)
                    {
                        if (points[j] > maxY)
                        {
                            maxY = points[j];
                        }
                    }
                }
                
            }
            return maxY;
        }

        public static string[] ParsePathData(string pathString)
        {
            // Regular expression to match commands in the path data
            string pattern = @"[MLCZ][^MLCZ]*";

            // Extract commands from the path data
            string[] matches = Regex.Matches(pathString, pattern)
                                    .Cast<Match>()
                                    .Select(m => m.Value)
                                    .ToArray();

            return matches;
        }

        private static double[] ExtractPointsFromCommand(string command)
        {
            // Split the command string and remove the command identifier
            string[] parts = command.Substring(1).Split(',');

            // Convert parts to doubles
            double[] points = Array.ConvertAll(parts, Double.Parse);

            return points;
        }
    }
}
