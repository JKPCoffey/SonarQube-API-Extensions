package utilities;

import java.io.File;
import java.io.FileFilter;

/**
 * Common FileFilter in use by test classes.
 * @author Jack Coffey
 */
public class ExamplesFileFilter implements FileFilter 
{
	@Override
	public boolean accept(File file)
	{
		String filename = file.getName();
		return filename.contains("table") && !(filename.contains("drill")) && !(filename.contains("layout"));
	}
}
