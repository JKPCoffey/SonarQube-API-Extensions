package data.reader;

import java.io.IOException;

/**
 * An interface for Reading and providing values from .rel files.<p>
 * .rel files contain the system Check relational data e.g Domain gives Subdomain, Subdomain gives Check and Check gives Implementation.
 * @author Jack Coffey
 *
 * @param <T> The type of the Keys in use in the relation.
 * @param <Q> The type of the Values in use in the relation.
 */
public interface RelationStreamAnalyser <T, Q>
{
	/**
	 * Read through a .rel file, and store the relation data in a data construct.
	 * @throws IOException due to directly using files, we can expect readStream implementations to throw an IOException
	 */
	public abstract void analyseStream() throws IOException;
	
	
	/**
	 * A relation is compromised of Keys and Values.<p>
	 * Many times it's important to know the possible Keys of a Relation, in order to iterate through the values.
	 * @return An exhaustive array of type T of all T keys in this .rel file.
	 */
	public abstract T[] getKeys();
	
	
	/**
	 * A relation is compromised of Keys and Values.<p>
	 * Keys give Values, in other words we can get a Value by providing the Key that the value is relationally linked to.
	 * @param key A T type key used to identify values.
	 * @return A Q type Value relationally linked to the provided Key.
	 */
	public abstract Q getValue(T key);
}
