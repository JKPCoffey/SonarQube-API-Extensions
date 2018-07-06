package data.reader;

import java.io.IOException;
import java.io.InputStream;

/**
 * Factory class for retrieving RelationStreamReader subclasses.
 * @author Jack Coffey
 */
public abstract class RelationStreamAnalyserFactory
{
	public static final String DOMAIN_SUBDOMAIN = "Domain";
	public static final String SUBDOMAIN_CHECKS = "Checks";
	public static final String IMPL_CHECK = "Impls";

	private RelationStreamAnalyserFactory()
	{
		//Page intentionally left blank to prevent instantiation. Even though this is an abstract class, Java provides an implicit default constructor.
	}
	
	/**
	 * A factory method for the RelationStreamReader type.<p>
	 * This class uses constants to determine the provided type, other wise it will throw an IllegalArgumentException.<p>
	 * This method allows users to provide just the filename to return the requested subclass.
	 * @param type A String indicating the requested subclass.
	 * @param filename A String representing the .rel file.
	 * @return An instance of a RelationStreamReader subclass.
	 * @throws IOException if the provided file is not a .rel file.
	 * @throws IllegalArgumentException if the provided type is not one of the class constants.
	 */
	public static final RelationStreamAnalyser getReader(String type, String filename) throws IOException, IllegalArgumentException
	{
		if(type == IMPL_CHECK || type == SUBDOMAIN_CHECKS || type == DOMAIN_SUBDOMAIN)
		{
			if(filename.endsWith(".rel"))
				return getReader(type, RelationStreamAnalyserFactory.class.getResourceAsStream(filename));
		
			else
				throw new IOException();
		}
		
		else
			throw new IllegalArgumentException("The provided type must be one of this class's constant type Strings.");
	}
	
	private static final RelationStreamAnalyser getReader(String type, InputStream stream) throws IOException
	{
		RelationStreamAnalyser<?, ?> result = null;
		
		if(type.equals(DOMAIN_SUBDOMAIN))
			result = new SubdomainDomainStreamAnalyser(stream);
		
		
		else if(type.equals(SUBDOMAIN_CHECKS))
			result = new CheckSubdomainStreamAnalyser(stream);
		
		
		else if(type.equals(IMPL_CHECK))	
			result = new ImplementationCheckStreamAnalyser(stream);
		
		
		return result;
	}
}